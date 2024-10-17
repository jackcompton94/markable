// api/deleteNote.js
export default async function handler(req, res) {
    const DW_AUTH_TOKEN = process.env.DW_AUTH_TOKEN;
    const DW_API_URL = process.env.DW_API_URL;

    if (req.method === 'DELETE') {
        const { username, title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const options = {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${DW_AUTH_TOKEN}`
            }
        };

        try {
            const response = await fetch(`${DW_API_URL}/datasets/markable-repo/${username}/files/${encodeURIComponent(title)}`, options);
            
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            res.status(200).json({ message: `Deleted note titled "${title}" successfully.` });
        } catch (error) {
            console.error('Error deleting note:', error);
            res.status(500).json({ error: 'Failed to delete note' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
