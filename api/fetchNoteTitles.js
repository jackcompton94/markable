// api/fetchNoteTitles.js
export default async function handler(req, res) {
    const DW_AUTH_TOKEN = process.env.DW_AUTH_TOKEN;
    const DW_API_URL = process.env.DW_API_URL;

    if (req.method === 'GET') {
        const { username } = req.query;

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${DW_AUTH_TOKEN}`
            }
        };

        try {
            const response = await fetch(`${DW_API_URL}/projects/markable-repo/${username}`, options);
            if (!response.ok) {
                throw new Error('Failed to fetch note titles');
            }
            const data = await response.json();
            const titles = data.files.map(file => ({ title: file.name }));
            res.status(200).json(titles);
        } catch (error) {
            console.error('Error fetching note titles:', error);
            res.status(500).json({ error: 'Failed to fetch note titles' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
