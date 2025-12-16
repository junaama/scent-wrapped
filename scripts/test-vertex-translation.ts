
import { translateFashionToScentWithLLM } from "../src/lib/ai/translate-fashion";

async function main() {
    console.log("Testing Vertex AI translation...");
    try {
        const result = await translateFashionToScentWithLLM(["minimalist", "clean", "modern"]);
        console.log("Success! Result:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error testing Vertex AI:", error);
    }
}

main();
