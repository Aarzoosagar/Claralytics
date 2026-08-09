# Claralytics — AWS Deployment Guide

This folder contains everything needed to run Claralytics on AWS following the
target architecture:

```
React (frontend, unchanged) → FastAPI on EC2 (Ubuntu) → Amazon S3 (datasets/reports)
                                        ↓                        ↑
                                  CloudWatch (logs/metrics)   IAM Role (no access keys)
```

Go through the phases in order. Each phase works standalone and doesn't break
anything from the previous one.

---

## Phase 1 — EC2 Deployment

1. Launch an EC2 instance: Ubuntu 22.04 LTS, t3.small or larger (pandas/sklearn
   need more than t2.micro's 1GB RAM comfortably). Open inbound ports 22 (SSH)
   and 80 (HTTP) in the security group.
2. Copy the project to the instance (`git clone` or `scp -r`).
3. On the instance:
   ```bash
   cd ~/claralytics/deploy
   chmod +x setup_ec2.sh
   ./setup_ec2.sh
   ```
   This creates a venv, installs dependencies, installs the `claralytics-api`
   systemd service, and configures nginx as a reverse proxy on port 80.
4. Edit `~/claralytics/backend/.env` (copied from `.env.example`) with a real
   `SECRET_KEY`. Leave `STORAGE_BACKEND=local` for now — you'll flip it to
   `s3` in Phase 2.
5. Restart and verify:
   ```bash
   sudo systemctl restart claralytics-api
   curl http://localhost/health
   ```
6. Point the frontend at the instance: in `frontend/.env` (or wherever
   `VITE_API_URL` is set), use `http://<EC2_PUBLIC_DNS>`. **No frontend code
   changes needed** — it already reads `VITE_API_URL`.

---

## Phase 2 — S3 Integration

1. Create an S3 bucket, e.g. `claralytics-datasets-prod`:
   ```bash
   aws s3api create-bucket --bucket claralytics-datasets-prod --region ap-south-1 \
     --create-bucket-configuration LocationConstraint=ap-south-1
   aws s3api put-public-access-block --bucket claralytics-datasets-prod \
     --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
   aws s3api put-bucket-encryption --bucket claralytics-datasets-prod \
     --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
   ```
2. In `backend/.env` on the instance, set:
   ```
   STORAGE_BACKEND=s3
   S3_BUCKET_NAME=claralytics-datasets-prod
   AWS_REGION=ap-south-1
   ```
3. Restart the service. From this point, new uploads and generated reports go
   straight to S3 — nothing is written to the instance's local disk.
   Existing rows from before this change (if any) keep working via the local
   fallback path built into `get_dataframe_for_dataset()`.

> You won't have real AWS credentials yet, and that's expected — this phase
> only works end-to-end once Phase 3's IAM role is attached (see below).

---

## Phase 3 — IAM Roles (no access keys, anywhere)

1. Create the IAM policy from `iam-policy.json` (replace the bucket name
   placeholder first):
   ```bash
   aws iam create-policy --policy-name ClaralyticsEC2Policy \
     --policy-document file://iam-policy.json
   ```
2. Create a role for EC2 and attach the policy:
   ```bash
   aws iam create-role --role-name ClaralyticsEC2Role \
     --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
   aws iam attach-role-policy --role-name ClaralyticsEC2Role \
     --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ClaralyticsEC2Policy
   aws iam create-instance-profile --instance-profile-name ClaralyticsEC2Profile
   aws iam add-role-to-instance-profile --instance-profile-name ClaralyticsEC2Profile \
     --role-name ClaralyticsEC2Role
   ```
3. Attach the instance profile to your running EC2 instance:
   ```bash
   aws ec2 associate-iam-instance-profile \
     --instance-id <YOUR_INSTANCE_ID> \
     --iam-instance-profile Name=ClaralyticsEC2Profile
   ```
4. Verify boto3 picks it up with zero configuration:
   ```bash
   curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
   # should print: ClaralyticsEC2Role
   ```
   Confirm `backend/.env` has **no** `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
   — there shouldn't be any such variables anywhere in this project. Uploads
   should now succeed end-to-end.

---

## Phase 4 — CloudWatch Logging & Monitoring

1. Install the CloudWatch Agent:
   ```bash
   wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
   sudo dpkg -i amazon-cloudwatch-agent.deb
   ```
2. Copy the config and start the agent:
   ```bash
   sudo mkdir -p /var/log/claralytics
   sudo cp cloudwatch-agent-config.json /opt/aws/amazon-cloudwatch-agent/etc/config.json
   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
     -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
   ```
   (The `logs:*` and `cloudwatch:PutMetricData` permissions the agent needs
   are already in `iam-policy.json` from Phase 3 — no separate role needed.)
3. In `backend/.env`, set:
   ```
   LOG_FILE_PATH=/var/log/claralytics/app.log
   ```
   and restart `claralytics-api`. The app now writes to both stdout (visible
   via `journalctl -u claralytics-api -f`) and the log file the agent tails.
4. Confirm logs are arriving:
   ```bash
   aws logs describe-log-streams --log-group-name /claralytics/app
   ```
5. (Optional) Set a CloudWatch Alarm on CPU or a custom metric — ask if you'd
   like one added; nothing is created here by default so you control cost.

---

## Rollback / local development

Nothing above is required to run the project locally. `STORAGE_BACKEND=local`
(the config default) reproduces the original local-disk behaviour exactly,
with no AWS account needed — useful for `uvicorn app.main:app --reload` during
development.
