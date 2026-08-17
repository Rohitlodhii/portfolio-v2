import fs from 'fs/promises'

export async function writeData( filePath : string , data : string ){
        try {
            await fs.writeFile(
                filePath ,
                JSON.stringify(data , null ,2),
                "utf-8"
            );
        } catch {
            throw new Error("Failed to write data to " + filePath);
        }
}