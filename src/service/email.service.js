const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await fetch("https://zgr40f2dtg.execute-api.us-east-1.amazonaws.com/prod/enviar-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, html }),
        });

        const result = await response.json();

        if (!response.ok) {
        console.error("Erro ao enviar e-mail:", result);
        return { success: false, error: result };
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Erro na requisição de e-mail:", error);
        return { success: false, error };
    }
};

export default { sendEmail };