import express, { Request, Response } from "express";
import cors from "cors";
import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const cohere = new CohereClient({
  token: process.env.COHERE_TOKEN,
});

app.post("/query", async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const stream = await cohere.chatStream({
      message: req.body.message,
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
