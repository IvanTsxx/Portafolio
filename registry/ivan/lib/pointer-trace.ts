export interface PointerSample {
  x: number;
  y: number;
}

const holdAfterMove = 2.5;
const movedBy = 0.0001;

export class PointerTrace {
  x = 0.5;
  y = 0.5;
  isActive = false;
  private hasMoved = false;
  private idle = 0;

  update({ x, y }: PointerSample, step: number, isAnimating: boolean) {
    const nextX = (x + 1) / 2;
    const nextY = (y + 1) / 2;
    if (Math.abs(nextX - this.x) + Math.abs(nextY - this.y) > movedBy) {
      this.hasMoved = true;
      this.idle = 0;
    } else {
      this.idle += step;
    }
    this.x = nextX;
    this.y = nextY;
    this.isActive =
      this.hasMoved && (!isAnimating || this.idle < holdAfterMove);
  }
}
