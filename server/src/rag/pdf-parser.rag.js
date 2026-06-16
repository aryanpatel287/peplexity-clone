import { PDFParse } from 'pdf-parse';

//Decided not to use 

export async function parseUploadedPDF(dataBuffer) {
    const parser = new PDFParse({
        data: dataBuffer,
    });

    const data = await parser.getText();

    console.log('Parsed PDF data: ', data);

    return data;
}

export async function parsePdfByLink(pdfLink) {
    const buffer = await fetch(pdfLink).then((res) => res.arrayBuffer());

    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const metadata = await pdf.getMetadata();

    console.log(`Total pages: ${totalPages}`);
    console.log(text);
    console.log('Metadata: ', metadata);

    return {
        text,
        metadata,
    };
}
