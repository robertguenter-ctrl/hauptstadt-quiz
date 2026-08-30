export type TileDirection = "up" | "down" | "left" | "right";

export function moveTileIndex(
  current: number,
  direction: TileDirection,
  columns = 3,
  total = 9,
): number {
  const row = Math.floor(current / columns);
  const col = current % columns;
  const maxRow = Math.ceil(total / columns) - 1;

  let nextRow = row;
  let nextCol = col;

  switch (direction) {
    case "up":
      nextRow = Math.max(0, row - 1);
      break;
    case "down":
      nextRow = Math.min(maxRow, row + 1);
      break;
    case "left":
      nextCol = Math.max(0, col - 1);
      break;
    case "right":
      nextCol = Math.min(columns - 1, col + 1);
      break;
  }

  return Math.min(nextRow * columns + nextCol, total - 1);
}
