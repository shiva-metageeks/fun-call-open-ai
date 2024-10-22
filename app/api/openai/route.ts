import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ethers } from 'ethers';
import OpenAIclient from '@/utils/openai/openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index.mjs';

const getBalance = async (walletAddress:string) => {
    if(!walletAddress) return "invalid wallet address";
    const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo');
    const balance = await provider.getBalance(walletAddress);

    return ethers.formatEther(balance);
}

export const GET = async (request: NextRequest) => {

    const walletAddress = request.nextUrl.searchParams.get('walletAddress') || "";

    const messages: ChatCompletionMessageParam[] = [  
        { role: "system", content: "You are an Crypto Financial Assistant. Use the supplied tools to assist the user." },
        { role: "user", content: "What is my wallet balance?" },
    ];

    const tools: ChatCompletionTool[] = [
        {
            type: "function",
            function: {
                name: "get_balance",
                description: "Get the balance for a web3 wallet address. Call this whenever you need to know the balance, for example when a i asks 'What is my wallet balance?'",
                parameters: {
                    "type": "object",
                    "properties": {
                        "wallet_address": {
                            "type": "string",
                            "description": "The web3 wallet address.",
                        },
                    },
                    "required": ["wallet_address"],
                    "additionalProperties": false,
                }
            }
        }
    ];

    try {
        const result = await OpenAIclient.chat.completions.create({  
            model: "gpt-3.5-turbo-1106",
            messages: messages,  
            tools: tools,   
            tool_choice: "auto",
        });   

        const message = result.choices[0].message;
        // console.log(message, "message"); 
        const balance = await getBalance(walletAddress);
                
                // Add the function response to the conversation
                messages.push(message);
                messages.push({
                    role: "user",
                    content: `This is my wallet address: ${walletAddress}`
                });
                messages.push({
                    role: "function",
                    name: "get_balance",
                    content: balance.toString(),
                });

                // Get a new response from the model
                const secondResult = await OpenAIclient.chat.completions.create({
                    messages: messages,
                    model: "gpt-3.5-turbo-0613",
                    tool_choice: "auto",
                    tools: tools as ChatCompletionTool[],
                });

                const responseContent = secondResult.choices[0].message.content;

        return NextResponse.json({
            success: true,
            res:result.choices[0].message.tool_calls ,
            // message: message.tool_calls ? "Balance retrieved" : "Response generated",
            // response: message.tool_calls,
            responseContent:responseContent
        }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: "Something went wrong while getting the response"
        }, { status: 500 });
    }
};
