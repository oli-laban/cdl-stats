import { SeasonDropdownItem } from '../types.js'
import CdlStage from './CdlStage.js'
import SeasonData from '../../SeasonData.js'

export default class CdlSeason extends SeasonData {
  public stages: CdlStage[] = []

  constructor(public data: SeasonDropdownItem) {
    super()
  }

  splits(): CdlStage[] {
    return this.stages
  }

  name(): string {
    return this.data.name
  }

  slug(): string {
    return this.data.slug
  }

  addStage(stage: CdlStage): void {
    this.stages.push(stage)
  }
}
