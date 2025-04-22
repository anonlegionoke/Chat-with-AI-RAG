import {
    createStreamDataTransformer,
    Message as VercelChatMessage,
} from 'ai';
import { PromptTemplate } from '@langchain/core/prompts';

import { JSONLoader } from "langchain/document_loaders/fs/json";
import { formatDocumentsAsString } from 'langchain/util/document';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from "@langchain/core/runnables";

const loader = new JSONLoader(
    "src/data/context.json"
);

export const dynamic = 'force-dynamic'

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `Answer the user's questions based only on the following context. If the answer is not in the context, reply that you do not have that information available, it is out of scope for the context provided:
==============================
Context: {context}
==============================

Current conversation: {chat_history}

user: {message}
assistant:`;


export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

        const currentMessageContent = messages[messages.length - 1].content;

        const docs = await loader.load();

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const context = formatDocumentsAsString(docs);

        const model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.0-flash',
            apiKey: process.env.GEMINI_API_KEY!,
            temperature: 0
        });

        const parser = new HttpResponseOutputParser();

        // const chain = prompt.pipe(model).pipe(parser as any);

        const chain = RunnableSequence.from([
            (input: {
                chat_history: string;
                message: string;
            }) => ({
                message: input.message,
                chat_history: input.chat_history,
                context,
            }),
            prompt,
            model,
            parser as any,
        ]);

        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            message: currentMessageContent
        })

        return new Response(stream.pipeThrough(createStreamDataTransformer()),
        {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
            },
        });
    } catch (e: any) {
        return Response.json({ error: e.message }, { status: e.status ?? 500 });
    }
}