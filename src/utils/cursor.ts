interface CursorPosition {
  x: number;
  y: number;
}

const lerp = (from: number, to: number, amount: number): number => (1 - amount) * from + amount * to;

const cursorInit = (): Cursor => new Cursor();

class Cursor {
  private cursor!: HTMLDivElement;
  private styleElement!: HTMLStyleElement;
  private position: { curr: CursorPosition | null; prev: CursorPosition | null } = {
    curr: null,
    prev: null,
  };

  constructor() {
    this.create();
    this.init();
    this.render();
  }

  private move(left: number, top: number): void {
    this.cursor.style.left = `${left}px`;
    this.cursor.style.top = `${top}px`;
  }

  private create(): void {
    this.cursor = document.createElement("div");
    this.cursor.id = "cursor";
    this.cursor.classList.add("xs-hidden", "hidden");
    document.body.append(this.cursor);

    this.styleElement = document.createElement("style");
    this.styleElement.textContent = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='10px' height='10px'><circle cx='4' cy='4' r='4' fill='white' /></svg>") 4 4, auto !important}`;
    document.body.append(this.styleElement);
  }

  private init(): void {
    document.onmousemove = (event) => {
      const position = { x: event.clientX - 8, y: event.clientY - 8 };
      if (!this.position.curr) this.move(position.x, position.y);
      this.position.curr = position;
      this.cursor.classList.remove("hidden");
    };
    document.onmouseenter = () => this.cursor.classList.remove("hidden");
    document.onmouseleave = () => this.cursor.classList.add("hidden");
    document.onmousedown = () => this.cursor.classList.add("active");
    document.onmouseup = () => this.cursor.classList.remove("active");
  }

  private render = (): void => {
    if (this.position.prev && this.position.curr) {
      this.position.prev.x = lerp(this.position.prev.x, this.position.curr.x, 0.35);
      this.position.prev.y = lerp(this.position.prev.y, this.position.curr.y, 0.35);
      this.move(this.position.prev.x, this.position.prev.y);
    } else {
      this.position.prev = this.position.curr;
    }
    requestAnimationFrame(this.render);
  };
}

export default cursorInit;
