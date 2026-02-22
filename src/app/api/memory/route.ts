import { createStreamDataTransformer } from 'ai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const message = messages.at(-1).content;


        const chatHistory = messages
            .map((msg: { role: string, content: string }) => `${msg.role}: ${msg.content}`)
            .join('\n');
        const prompt = PromptTemplate.fromTemplate(
            "`You are a helpful assistant.\n{history}\nassistant:`"
        );

        const model = new ChatGoogleGenerativeAI({
            model: process.env.GEMINI_MODEL!,
            apiKey: process.env.GEMINI_API_KEY!
        });

        const parser = new HttpResponseOutputParser();

        const chain = prompt.pipe(model).pipe(parser as any);

        const stream = await chain.stream({
            message,
            history: chatHistory
        });

        return new Response(stream.pipeThrough(createStreamDataTransformer()),
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                },
            }
        );
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}