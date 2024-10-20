import SplitData from './SplitData.js'

export default abstract class SeasonData {
  abstract name(): string

  abstract splits(): SplitData[]

  year(): number {
    const match = this.name().match(/^\d{4}/)

    return parseInt(match[0])
  }

  release(): string {
    switch (this.year()) {
      case 2021:
        return 'CW'
      case 2022:
        return 'Vanguard'
      case 2023:
        return 'MWII'
      case 2024:
        return 'MWIII'
      case 2025:
        return 'BO6'
      default:
        return ''
    }
  }
}
