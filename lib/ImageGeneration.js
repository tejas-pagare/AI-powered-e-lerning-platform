import axios from "axios";

const BASE_URL = 'https://aigurulab.tech';
export const generateImage = async (ImagePrompt) => {
  try {
    const result = await axios.post(BASE_URL + '/api/generate-image',
      {
        width: 1024,
        height: 1024,
        input: ImagePrompt,
        model: 'flux',//'flux'
        aspectRatio: "16:9"//Applicable to Flux model only
      },
      {
        headers: {
          'x-api-key': process.env.AI_IMAGE_API_KEY, // Your API Key
          'Content-Type': 'application/json', // Content Type
        },
      })

    return result.data.image;
  } catch (error) {
    return error.message;
  }

}
