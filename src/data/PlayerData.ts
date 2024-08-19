export default abstract class PlayerData {
  abstract id(): number | null

  abstract idType(): 'CDL' | 'BP'

  abstract name(): string

  abstract syncUsing(): 'id' | 'name'

  abstract firstName(): string | null

  abstract lastName(): string | null

  abstract fullName(): string | null

  abstract country(): string | null

  abstract twitterUrl(): string | null

  abstract twitchUrl(): string | null

  abstract youtubeUrl(): string | null
}
