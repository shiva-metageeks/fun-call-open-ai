import { AzureOpenAI } from "openai";

const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "https://yt-chat-gpt-shiva.openai.azure.com/";  
const apiKey = process.env["AZURE_OPENAI_API_KEY"] || "<REPLACE_WITH_YOUR_KEY_VALUE_HERE>";  
const apiVersion = "2024-05-01-preview";  
const deployment = "yt-chat-gpt"; 
        
const OpenAIclient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment }); 

export default OpenAIclient;