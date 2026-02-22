import {
    createStreamDataTransformer,
    Message as VercelChatMessage,
} from 'ai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { formatDocumentsAsString } from 'langchain/util/document';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from "@langchain/core/runnables";
import { existsSync } from 'fs';
import { join } from 'path';
import { Document } from '@langchain/core/documents';

export const dynamic = 'force-dynamic'

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a helpful, conversational, and engaging AI assistant.
Use the following context as your primary source of knowledge to answer the user's questions.

Guidelines:
- If the user asks a general question (e.g., "what do you know?", "what can you tell me?"), provide a friendly summary of all the topics and types of information available in the context.
- If the user asks about a specific topic, provide a detailed, well-structured response using facts from the context. Highlight interesting or notable details when relevant.
- If the user asks to compare items or find superlatives (e.g., "largest", "oldest"), analyze across the full context to provide accurate answers.
- Use markdown formatting (bold, bullet points, headers) to make responses easy to read.
- If the answer cannot be found in or reasonably inferred from the context, say so politely — but never make up facts.

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

        // Check for both JSON and PDF files
        const dataDir = join(process.cwd(), 'src', 'data');
        const jsonPath = join(dataDir, 'context.json');
        const pdfPath = join(dataDir, 'context.pdf');

        let docs: Document[] = [];

        if (existsSync(jsonPath)) {
            const jsonLoader = new JSONLoader(jsonPath);
            const jsonDocs = await jsonLoader.load();
            docs = [...docs, ...jsonDocs];
        }

        if (existsSync(pdfPath)) {
            const pdfLoader = new PDFLoader(pdfPath);
            const pdfDocs = await pdfLoader.load();
            docs = [...docs, ...pdfDocs];
        }

        if (docs.length === 0) {
            throw new Error('No context files found. Please upload a JSON or PDF file first.');
        }

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const context = formatDocumentsAsString(docs);

        const model = new ChatGoogleGenerativeAI({
            model: process.env.GEMINI_MODEL!,
            apiKey: process.env.GEMINI_API_KEY!,
            temperature: 0.3
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
        });

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