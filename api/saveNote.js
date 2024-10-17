// api/saveNote.js
export default async function handler(req, res) {
    const DW_AUTH_TOKEN = process.env.DW_AUTH_TOKEN;
    const DW_API_URL = process.env.DW_API_URL;

    if (req.method === 'POST') {
        const { username, title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const formData = new FormData();
        formData.append('file', new Blob([content], { type: 'text/markdown' }), title);

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${DW_AUTH_TOKEN}`
            },
            body: formData
        };

        try {
            const response = await fetch(`${DW_API_URL}/uploads/markable-repo/${username}/files`, options);
            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            res.status(200).json({ message: 'Note saved successfully' });
        } catch (error) {
            console.error('Error saving note:', error);
            res.status(500).json({ error: 'Failed to save note' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
