import OpenAI from "openai"

import dotenv from "dotenv"

import { PdfReader } from "pdfreader"
import fs from "fs/promises"
import path from "path"

dotenv.config()

const folderPath = "./CVs"
let data = []

function parsePdf(filePath) {
  return new Promise((resolve, reject) => {
    const pdfReader = new PdfReader()

    const pdfData = []

    pdfReader.parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err)
      } else if (!item) {
        resolve(pdfData.join(""))
      } else if (item.text) {
        pdfData.push(item.text)
      }
    })
  })
}

async function readPdfFiles() {
  try {
    const files = await fs.readdir(folderPath)

    for (const file of files) {
      const filePath = path.join(folderPath, file)
      if (path.extname(filePath).toLowerCase() === ".pdf") {
        // Only process PDF files
        const pdfContent = await parsePdf(filePath)
        data.push(pdfContent)
      }
    }

    // console.log(data)
  } catch (error) {
    console.error(error)
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAIAPIKEY,
})


async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `The following are the resumes of multiple applicants. Please help me filter out some of applicants: ${data
          .map((item) => `'${item}'`)
          .join(",")}. And how many token does this api call costed?`,
      },
      {
        role: "user",
        content: `Please help me select graduates from uoa, and who is back end developer`,
      },
    ],
    // temperature: 0.7,
    // max_tokens: 64,
    // top_p: 1,
  })

  console.log(response.choices[0].message.content)
}

await readPdfFiles()

await main()
