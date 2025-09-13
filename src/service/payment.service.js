import firebase from '../config/firebase';
import emailService from './email.service';
require('firebase/auth')

const db = firebase.firestore();

const formatCurrency = (value) => {
    if (!value || isNaN(Number(value))) return "R$ 0,00";
    return Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    }).format(Number(value));
};

const paymentService = {

    async prepareEmail(dadoDriver, dataFreight, Subject, obs, valorSolicitado, valorOriginal, valorAdicional, valorDesconto, type) {

        const dateFormat = (date) => {
            if (!date) return "";

            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year}`;
        };

        const freightNumber = dataFreight?.numberSerial;
        const subject = `${Subject} - Carga ${dateFormat(dataFreight?.firstDelivery.dateColeta) || ""} - ${dataFreight?.clientPayment?.name} - ${dataFreight?.firstDelivery?.city || ""} - ${dataFreight?.firstDelivery?.uf || ""} para ${dataFreight?.lastDelivery?.city || ""} - ${dataFreight?.lastDelivery?.uf || ""} - ${dataFreight?.numberSerial || ""}`;
        const assunto = `${Subject} - Carga ${dateFormat(dataFreight?.firstDelivery.dateColeta) || ""} - ${dataFreight?.clientPayment?.name} <br> ${dataFreight?.firstDelivery?.city || ""} - ${dataFreight?.firstDelivery?.uf || ""} para ${dataFreight?.lastDelivery?.city || ""} - ${dataFreight?.lastDelivery?.uf || ""} - ${dataFreight?.numberSerial || ""}`;
        const to = "financeiro@fortio.com.br"

        const getBankData = () => {
            const bank = (dadoDriver.documents && dadoDriver.documents[0] && dadoDriver.documents[0].dataBank) || {};
            return {
                bankName: bank.bankName || "Banco não informado",
                agency: bank.agency || "Agência não informada",
                account: `${bank.accountNumber || "Conta não informada"} - ${bank.accountDigit || "Dígito não informado"}`,
                pix: bank.pix || "Pix não informado",
            };
        };

        const bank = getBankData();

            const html = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                <meta charset="UTF-8" />
                <title>${subject + " - " + freightNumber}</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f6f6f6;
                    padding: 20px;
                    margin: 0;
                    color: #000;
                }
                .container {
                    margin: auto;
                    background-color: #002444;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    color: #ffffff;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo img {
                    width: 200px;
                }
                .bodyWork {
                    text-align: center;
                    justify-content: center;
                    align-items: center;
                    margin: 20px 0;
                }
                h1 {
                    font-size: 22px;
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 10px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                }
                .pValorSolicitado {
                    font-size: 18px;
                    line-height: 1.6;
                }
                .img-row {
                    text-align: center;
                    margin-top: 10px;
                }
                .labelImg {
                    text-align: center;
                    margin-top: 5px;
                }
                .credenciais {
                    text-align: start;
                    display: inline-block;
                }
                .labelImg p, .img-row a {
                    font-size: 14px;
                    display: inline-block;
                    margin: 0 12px;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 13px;
                    text-align: center;
                    justify-content: center;
                    align-items: center;
                    background-color: #002444;
                    border-radius: 8px;
                    padding: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    color: #fff;
                }
                </style>
                </head>
                <body>
                    <div class="container">
                    <div class="logo">
                        <img src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2FFortio%20H%201.png?alt=media&token=0bdbbdbf-3696-4484-ae5f-ad63150e68b7" alt="Fortio Logo" />
                    </div>
                    </div>

                    <div class="bodyWork">
                        <h1>${assunto}</h1>

                        <div class="credenciais">
                            <p><strong>Embarcador:</strong> ${dataFreight?.clientPayment?.name || "Não informado"}</p>
                            <p><strong>Motorista:</strong> ${dadoDriver?.name || "Não informado"}</p>
                            <p><strong>Dados Bancários:</strong> Banco: ${bank.bankName} / AG: ${bank.agency} / Conta: ${bank.account}</p>
                            <p><strong>Chave PIX:</strong> ${bank.pix}</p>
                            <p><strong>Frete:</strong> ${dataFreight?.numberSerial || "-"} - ${dataFreight?.firstDelivery?.city || ""} - ${dataFreight?.firstDelivery?.uf || ""} para ${dataFreight?.lastDelivery?.city || ""} - ${dataFreight?.lastDelivery?.uf || ""}</p>
                            <p><strong>Tipo do Pagamento:</strong> ${type}</p>
                            <p><strong>Valor Negociado:</strong> ${formatCurrency(valorOriginal)}</p>
                            <p><strong>Valor Adicional:</strong> ${formatCurrency(valorAdicional)} </p>
                            <p><strong>Valor Desconto:</strong> ${formatCurrency(valorDesconto)} </p>
                            <p class="pValorSolicitado"><strong>Valor Solicitado:</strong> <strong>${formatCurrency(valorSolicitado)}</strong></p>
                            <p><strong>Negociação:</strong> ${dataFreight?.driver?.paymentCondition || "Não informado"}</p>
                            <p><strong>Observações:</strong> ${obs || "Nenhuma observação"}</p>
                        </div>
                    </div>

                    <div class="footer">
                        <p><strong>Siga-nos:</strong></p>
                        <div class="img-row">
                            <img style="margin-right: 20px;" src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Ffacebook.png?alt=media&token=a3d67757-8280-40d4-ab36-dd9623d6c910" alt="Facebook" width="40" height="40" />
                            <img style="margin-right: 20px;" src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Finstagram.png?alt=media&token=3096f43f-0d40-42b3-a091-78bf1c7722cd" alt="Instagram" width="40" height="40" />
                            <img src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Flinkedin.png?alt=media&token=4ccbc038-fee6-4760-b55c-145feeb84f32" alt="LinkedIn" width="40" height="40" />
                        </div>
                    </div>
                </body>
            </html>
        `;

        try {

            const result = await emailService.sendEmail({ to, subject, html });

            if (result.success) {
                alert("E-mail enviado com sucesso!");
                console.log("E-mail enviado com sucesso:", result.data);
            } else {
                console.error("Erro ao enviar e-mail:", result.error);
            }
        } 
        catch (err) {
            console.error("Erro inesperado ao tentar enviar e-mail:", err);
        }

    },

    async prepareEmailDriver(password, email) {

        const subject = "Envio de senha para acesso Fortio APP";
        const to = email;

        // const formatCurrency = (value) => {
        //     if (!value || isNaN(Number(value))) return "Não informado";
        //     return Intl.NumberFormat('pt-BR', {
        //     style: 'currency',
        //     currency: 'BRL',
        //     }).format(Number(value));
        // };

        const html = `
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8" />
                <title>${subject}</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f6f6f6;
                    padding: 20px;
                    margin: 0;
                    color: #000;
                }
                .container {
                    margin: auto;
                    background-color: #002444;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    color: #ffffff;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo img {
                    width: 150px;
                }
                .bodyWork {
                    text-align: center;
                    justify-content: center;
                    align-items: center;
                    margin: 20px 0;
                }
                h1 {
                    font-size: 22px;
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 10px;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                }
                .pValorSolicitado {
                    font-size: 18px;
                    line-height: 1.6;
                }
                .img-row {
                    text-align: center;
                    margin-top: 10px;
                }
                .labelImg {
                    text-align: center;
                    margin-top: 5px;
                }
                .credenciais {
                    text-align: start;
                    display: inline-block;
                }
                .labelImg p, .img-row a {
                    font-size: 14px;
                    display: inline-block;
                    margin: 0 12px;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 13px;
                    text-align: center;
                    justify-content: center;
                    align-items: center;
                    background-color: #002444;
                    border-radius: 8px;
                    padding: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    color: #fff;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="logo">
                    <img src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2FFortio%20H%201.png?alt=media&token=0bdbbdbf-3696-4484-ae5f-ad63150e68b7" alt="Fortio Logo" />
                </div>
                </div>

                <div class="bodyWork">
                    <h1><strong>Bem-vindo à Fortio!</strong></h1>

                    <p>A partir de agora você tem acesso à maior plataforma<br> de frete do Brasil!</p>

                    <p><strong>Para acessar, baixe o app e use as credenciais de primeiro<br> acesso:</strong></p>

                    <div class="credenciais">
                        <p><strong>Login:</strong> ${email || "Não informado"}</p>
                        <p><strong>Senha:</strong> ${password || "Não informado"}</p>
                    </div>

                    <p>Na Fortio você recebe notificações de fretes diretamente no app,<br>
                        gerencia suas entregas, seus ganhos e seus benefícios.<br>
                        Baixe agora mesmo!</p>

                    <p><strong>Baixe nosso app nas principais plataformas:</strong></p>
                    
                    <div class="img-row">
                        <a href="https://play.google.com/store/apps/details?id=com.fortio" target="_blank" rel="noopener noreferrer">
                            <img src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Fandroid.png?alt=media&token=692808af-2c9a-49f0-ac05-b62321be0ea9" alt="Android" width="40" height="40" />
                        </a>
                        <a href="https://apps.apple.com/br/app/fortio/id6748965216?l=en-GB" target="_blank" rel="noopener noreferrer">
                            <img src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Fapple-logo.png?alt=media&token=f9dfc01d-bb48-4041-b3f8-7dcf3d680d35" alt="iPhone" width="40" height="40" />
                        </a>
                    </div>
                    <div class="labelImg">
                        <p>Play Store</p>
                        <p>Apple Store</p>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>Siga-nos:</strong></p>
                    <div class="img-row">
                        <img style="margin-right: 20px;" src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Ffacebook.png?alt=media&token=a3d67757-8280-40d4-ab36-dd9623d6c910" alt="Facebook" width="40" height="40" />
                        <img style="margin-right: 20px;" src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Finstagram.png?alt=media&token=3096f43f-0d40-42b3-a091-78bf1c7722cd" alt="Instagram" width="40" height="40" />
                        <img src="https://firebasestorage.googleapis.com/v0/b/app-fortio.appspot.com/o/LogoEmail%2Flinkedin.png?alt=media&token=4ccbc038-fee6-4760-b55c-145feeb84f32" alt="LinkedIn" width="40" height="40" />
                    </div>
                </div>
            </body>
            </html>
        `;

        try {

            const result = await emailService.sendEmail({ to, subject, html });

            if (result.success) {
                console.log("E-mail enviado com sucesso:", result.data);
            } else {
                console.error("Erro ao enviar e-mail:", result.error);
            }
        } 
        catch (err) {
            console.error("Erro inesperado ao tentar enviar e-mail:", err);
        }

    },

    async prepareEmailFreight(dataFreight, Subject) {

        const subject = Subject || 'Solicitação de Envio de Frete';
        const to = "financeiro@fortio.com.br";

        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
            <meta charset="UTF-8" />
            <title>${subject}</title>
            <style>
                body {
                font-family: Arial, sans-serif;
                background-color: #f6f6f6;
                padding: 20px;
                }
                .container {
                max-width: 600px;
                margin: auto;
                background-color: #fff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .logo {
                text-align: center;
                margin-bottom: 20px;
                }
                .logo img {
                width: 150px;
                }
                h1 {
                font-size: 22px;
                color: #333;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 10px;
                }
                p {
                font-size: 16px;
                color: #555;
                line-height: 1.6;
                }
                .footer {
                margin-top: 30px;
                font-size: 13px;
                color: #999;
                text-align: center;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="logo">
                <img src="https://www.fortio.com.br/site/midia/logo.png" alt="Fortio Logo" />
                </div>

                <h1>${subject}</h1>

                <p><strong>Numero de Frete:</strong> ${dataFreight?.numberSerial || "Não informado"}</p>
                <p><strong>Origem/Destino do Frete:</strong> ${dataFreight?.firstDelivery?.city || ""} - ${dataFreight?.firstDelivery?.uf || ""} → ${dataFreight?.lastDelivery?.city || ""} - ${dataFreight?.lastDelivery?.uf || ""}</p>
                <p><strong>Tipo de Veiculo do Frete:</strong> ${dataFreight?.vehicle?.typeVehicle?.dados?.filter(v => v.selected).map(v => v.name).join(', ') || "Não informado"}</p>
                <p><strong>Tipo de Carroceria do Frete:</strong> ${dataFreight?.vehicle?.typeBodywork?.dados?.filter(c => c.selected).map(c => c.name).join(', ') || "Não informado"}</p>
                <p><strong>Peso do Frete:</strong> ${dataFreight?.freight?.weightCargo} </p>
                <p><strong>Valor NotaFiscal do Frete:</strong> ${formatCurrency(dataFreight?.freight?.valueNF)} </p>
                <p><strong>Valor do Frete:</strong> ${formatCurrency(dataFreight?.freight?.valueFreightage)} </p>
                <p><strong>Observações do Frete:</strong> ${dataFreight?.freight?.observation} </p>

                <div class="footer">
                Esta mensagem foi enviada automaticamente por Fortio.
                </div>
            </div>
            </body>
            </html>
        `;

        try {

            const result = await emailService.sendEmail({ to, subject, html });

            if (result.success) {
                console.log("E-mail enviado com sucesso:", result.data);
            } else {
                console.error("Erro ao enviar e-mail:", result.error);
            }
        } catch (err) {
            console.error("Erro inesperado ao tentar enviar e-mail:", err);
        }

    },

    async getEspecifico(idFreight) {
        console.log("[get] Buscando dados do pagamento mais especificos...");

        try {
            const snapshot = await db.collection('payment').where("idFreight", "==", idFreight).get();
            const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return payments;
        } catch (error) {
            console.error("[get] Erro ao buscar pagamentos:", error);
            return [];
        }
    },

        async getAll() {
        console.log("[get] Buscando dados do pagamento mais especificos...");

        try {
            const snapshot = await db.collection('payment').get();
            const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return payments;
        } catch (error) {
            console.error("[get] Erro ao buscar pagamentos:", error);
            return [];
        }
    },

    async save(data){
        console.log("[save] Salvando dados do pagamento ao incluir um motorista ")

        db.collection('payment')
            .add(data)
            .catch(error => {
                console.log(error)
            });
    },

    async update(data){
        console.log("[update] Atualizando pagamento")

        // console.log(data)
        db.collection('payment')
        .where("idFreight", "==", data.idFreight)
        .where("type", "==", data.type)
        .get()
        .then(querySnapshot => {
            if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
                doc.ref.update(data)
                .then(() => {
                    console.log(`Documento com idFreight ${data.idFreight} e type ${data.type} atualizado.`);
                })
                .catch(error => {
                    console.log("Erro ao atualizar documento:", error);
                });
            });
            } else {
            console.log("Nenhum documento encontrado com o idFreight e type especificados.");
            }
        })
        .catch(error => {
            console.log("Erro ao buscar documentos:", error);
        });
    },

    async delete(data) {
        try {
            console.log("[delete] Deletando pagamento");

            const querySnapshot = await db.collection('payment')
            .where("idFreight", "==", data.idFreight)
            .where("type", "==", data.type)
            .where("value", "==", data.value)
            .get();

            if (querySnapshot.empty) {
                console.log("Nenhum documento encontrado para deletar.");
                return;
            }

            const deletePromises = querySnapshot.docs.map((doc) => doc.ref.delete());

            await Promise.all(deletePromises);

            console.log(`Documentos com idFreight ${data.idFreight} e type ${data.type} deletados com sucesso.`);
        } catch (error) {
            console.error("Erro ao deletar pagamento:", error);
        }
    },

    async deleteAll(id) {
        try {
            console.log("[delete] Deletando pagamento");
            console.log(id);

            const querySnapshot = await db.collection('payment')
                .where("idFreight", "==", id)
                .get();

            if (querySnapshot.empty) {
                console.log("Nenhum documento encontrado para deletar.");
                return;
            }

            // Filtra os documentos que NÃO têm o campo addExpenses
            const deletePromises = querySnapshot.docs
                .filter(doc => !doc.data().addExpenses)
                .map(doc => doc.ref.delete());

            await Promise.all(deletePromises);

            console.log(`Documentos com idFreight ${id} deletados com sucesso (exceto os com addExpenses).`);
        } catch (error) {
            console.error("Erro ao deletar pagamento:", error);
        }
    },

    async deleteDetalhes(data) {
        try {
            console.log("[delete] Deletando pagamento");

            const querySnapshot = await db.collection('payment')
            .where("idFreight", "==", data.idFreight)
            .get();

            if (querySnapshot.empty) {
                console.log("Nenhum documento encontrado para deletar.");
                return;
            }

            const deletePromises = querySnapshot.docs.map((doc) => doc.ref.delete());

            await Promise.all(deletePromises);

            console.log(`Documentos com idFreight ${data.idFreight} e type ${data.type} deletados com sucesso.`);
        } catch (error) {
            console.error("Erro ao deletar pagamento:", error);
        }
    },

    async searchShipper(id) {
        try {
            console.log("[searchShipper] Buscando dados do shipper...");
            // console.log(id)

            const snapshot = await db.collection('shipper').doc(id).get();
            // const shipper = snapshot.docs.map(doc => ({
            //     id: doc.id,
            //     ...doc.data()
            // }));

            return snapshot.data();
        } catch (error) {
            console.error("[searchShipper] Erro ao buscar shipper:", error);
            return [];
        }
    }

}

export default paymentService;