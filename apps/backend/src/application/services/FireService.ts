import type { FireFocusData, IFireRepository } from '@domain/repositories/IFireRepository'

export class FireService {
  constructor(private readonly fireRepository: IFireRepository) {}

  async listFires(options?: { state?: string; biome?: string }): Promise<FireFocusData[]> {
    if (options?.state) return this.fireRepository.findByState(options.state)
    if (options?.biome) return this.fireRepository.findByBiome(options.biome)
    return this.fireRepository.findActive()
  }
}
