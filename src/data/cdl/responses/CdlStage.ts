import { StageTab } from '../types.js'
import CdlSubStage from './CdlSubStage.js'
import SplitData from '../../SplitData.js'
import TournamentData from '../../TournamentData.js'

export default class CdlStage extends SplitData {
  public subStages: CdlSubStage[] = []

  constructor(public data: StageTab<true>) {
    super()
  }

  name(): string {
    return this.data.title
  }

  tournaments(): TournamentData[] {
    return this.subStages
  }

  addSubStage(subStage: CdlSubStage): void {
    this.subStages.push(subStage)
  }

  getData(): StageTab {
    return this.data
  }
}
