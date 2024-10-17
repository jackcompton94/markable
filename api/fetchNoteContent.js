// api/fetchNoteContent.js
export default async function handler(req, res) {
    const DW_AUTH_TOKEN = process.env.DW_AUTH_TOKEN;
    const DW_API_URL = process.env.DW_API_URL;

    if (req.method === 'GET') {
        const { username, title } = req.query;

        const options = {
            method: 'GET',
            headers: {
                accept: '*/*',
                authorization: `Bearer ${DW_AUTH_TOKEN}`
            }
        };

        try {
            const response = await fetch(`${DW_API_URL}/file_download/markable-repo/${username}/${encodeURIComponent(title)}`, options);
            if (!response.ok) {
                throw new Error('Failed to fetch note content');
            }
            const data = await response.text();
            res.status(200).send(data);
        } catch (error) {
            console.error('Error fetching note content:', error);
            res.status(500).json({ error: 'Failed to fetch note content' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
