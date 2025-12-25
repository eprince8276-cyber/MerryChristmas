
export interface TreeConfig {
  count: number;
  height: number;
  baseRadius: number;
  scatterFactor: number;
}

export interface ParticleState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}
