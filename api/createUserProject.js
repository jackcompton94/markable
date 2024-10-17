export default async function handler(req, res) {
    const DW_AUTH_TOKEN = process.env.DW_AUTH_TOKEN; 
    const DW_API_URL = process.env.DW_API_URL;

    console.log(DW_API_URL, DW_AUTH_TOKEN)
    if (req.method === 'POST') {
      const { userId } = req.body;

      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${DW_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          visibility: 'OPEN',
          title: userId,
        }),
      };

      try {
        const response = await fetch(`${DW_API_URL}/projects/markable-repo`, options);
        const projectResponse = await response.json();

        if (!response.ok) {
          throw new Error(projectResponse.message || 'Failed to create project');
        }

        res.status(201).json({ message: 'Project created successfully', projectResponse });
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project.' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
