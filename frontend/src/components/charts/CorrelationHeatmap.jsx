import { useMemo } from 'react'

function getColor(value) {

  if (value === null || value === undefined) {
    return 'rgba(255,255,255,0.03)'
  }

  const v = Math.max(-1, Math.min(1, value))

  // Positive → white intensity
  if (v >= 0) {

    return `rgba(255,255,255,${
      0.06 + v * 0.9
    })`
  }

  // Negative → soft red
  return `rgba(239,68,68,${
    0.06 + Math.abs(v) * 0.9
  })`
}

function getTextColor(value) {

  if (value === null || value === undefined) {
    return '#52525B'
  }

  return Math.abs(value) > 0.45
    ? '#FFFFFF'
    : '#71717A'
}

export default function CorrelationHeatmap({
  data,
}) {

  const columns = useMemo(() => {

    if (!data?.columns) {
      return []
    }

    return data.columns

  }, [data])

  const matrix = useMemo(() => {

    if (!data?.matrix) {
      return {}
    }

    return data.matrix

  }, [data])

  if (!columns.length) {

    return (

      <div className="h-48 flex items-center justify-center text-sm text-zinc-600">

        No correlation data available

      </div>
    )
  }

  return (

    <div className="overflow-auto">

      <div
        className="inline-grid gap-[2px] min-w-max"
        style={{
          gridTemplateColumns: `90px repeat(${columns.length}, minmax(58px, 1fr))`,
        }}
      >

        {/* Empty top-left */}
        <div />

        {/* Column headers */}
        {columns.map((col) => (

          <div
            key={col}
            className="
              text-[10px]
              text-zinc-500
              text-center
              px-1
              py-2
              truncate
              sticky
              top-0
              bg-black
              z-10
            "
            title={col}
          >

            {col.length > 10
              ? `${col.slice(0, 9)}…`
              : col}

          </div>
        ))}

        {/* Matrix rows */}
        {columns.map((rowCol) => (

          <div
            key={`row-${rowCol}`}
            className="contents"
          >

            {/* Row label */}
            <div
              className="
                text-[10px]
                text-zinc-500
                flex
                items-center
                pr-2
                truncate
                sticky
                left-0
                bg-black
                z-10
              "
              title={rowCol}
            >

              {rowCol.length > 12
                ? `${rowCol.slice(0, 11)}…`
                : rowCol}

            </div>

            {/* Cells */}
            {columns.map((colCol) => {

              const val =
                matrix?.[rowCol]?.[colCol]

              const isDiagonal =
                rowCol === colCol

              return (

                <div
                  key={`${rowCol}-${colCol}`}
                  title={`${rowCol} × ${colCol}: ${
                    val !== null &&
                    val !== undefined
                      ? val.toFixed(3)
                      : 'N/A'
                  }`}
                  className="
                    h-11
                    flex
                    items-center
                    justify-center
                    text-[10px]
                    font-numeric
                    rounded-[2px]
                    transition-all
                    duration-150
                    hover:scale-[1.04]
                    hover:z-20
                  "
                  style={{
                    backgroundColor:
                      isDiagonal
                        ? 'rgba(255,255,255,0.95)'
                        : getColor(val),

                    color:
                      isDiagonal
                        ? '#000'
                        : getTextColor(val),

                    boxShadow:
                      isDiagonal
                        ? '0 0 0 1px rgba(255,255,255,0.08)'
                        : 'none',
                  }}
                >

                  {val !== null &&
                  val !== undefined
                    ? val.toFixed(2)
                    : ''}

                </div>
              )
            })}

          </div>
        ))}

      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5">

        <div
          className="h-2 rounded-sm flex-1 max-w-[240px]"
          style={{
            background:
              'linear-gradient(to right, rgba(239,68,68,0.9), rgba(255,255,255,0.08), rgba(255,255,255,0.95))',
          }}
        />

        <div className="flex items-center gap-5 text-[10px] text-zinc-600 whitespace-nowrap">

          <span>−1 Negative</span>

          <span>0 Neutral</span>

          <span>+1 Positive</span>

        </div>

      </div>

    </div>
  )
}