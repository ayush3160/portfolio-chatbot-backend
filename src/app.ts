import express, { Request, Response, text } from "express";
import cors from "cors";
import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
import { getPrompt } from "./prompts/prompt";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const cohere = new CohereClient({
  token: process.env.COHERE_TOKEN,
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    const prompt = getPrompt();

    const stream = await cohere.chatStream({
      message: `Answer the following query by taking context from documents only and summarise and reply according to you  \n\n query ${req.body.message}`,
      documents: [{ title: "Proffesional History of ayush", text: prompt }],
    });

    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });
    for await (const chat of stream) {
      if (chat.eventType === "text-generation") {
        res.write(chat.text);
      }
    }

    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Some Error Occured", error });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
