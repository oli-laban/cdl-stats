import { promises as fs } from 'node:fs'
import path from 'node:path'
import axios from 'axios'

const jsonPath = './json'

export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const saveDataAsJson = async (filename: string, data: object): Promise<void> => {
  const fullPath = path.join(jsonPath, filename)
  const dir = path.dirname(fullPath)

  await fs.mkdir(dir, { recursive: true })

  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8')
}

export const getJsonFromFile = async <T>(filename: string): Promise<T> => {
  const data = await fs.readFile(path.join(jsonPath, filename), 'utf8')

  return JSON.parse(data) as T
}

export const parseIntArrayOption = (value: string, array: number[]): number[] => {
  if (!array) {
    array = []
  }

  array.push(parseInt(value))

  return array
}

type HtmlResponse = string

export const fetchNextJsonString = async (url: string): Promise<string | null> => {
  const html = await axios.get<HtmlResponse>(url)
  const match = html.data.match(/<script.*id="__NEXT_DATA__".*?>(.*?)<\/script>/)

  return match?.[1]
}
