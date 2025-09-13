import React, { useEffect } from 'react';
import * as forge from 'node-forge';

function extractCpfCnpjFromAttrs(attrs) {
    const text = attrs;

    // Regex para CNPJ (ex: 12.345.678/0001-90)
    const cnpjMatch = text.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/) || text.match(/\d{14}/);

    // Regex para CPF (ex: 123.456.789-00)
    const cpfMatch = text.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/) || text.match(/\d{11}/);

    // debugger;
    return cnpjMatch?.[0] || cpfMatch?.[0] || '';
}

export function ReadCertificate(file, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const buffer = await file.arrayBuffer();
            const binary = String.fromCharCode(...new Uint8Array(buffer));
            const p12Der = forge.util.createBuffer(binary);
            const p12Asn1 = forge.asn1.fromDer(p12Der);
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
            const cert = certBags[0].cert;

            // console.log("Certificado do read:", cert);
            // debugger;

            const subjectAttrs = cert.subject.attributes;
            const issuerAttrs = cert.issuer.attributes;

            const subjectCN = subjectAttrs.find(attr => attr.name === 'commonName')?.value || '';
            const issuerCN = issuerAttrs.find(attr => attr.name === 'commonName')?.value || '';

            const serialNumber = cert.serialNumber;
            const notBefore = cert.validity.notBefore.toISOString();
            const notAfter = cert.validity.notAfter.toISOString();

            // Calcula o thumbprint (SHA-1 hash do DER)
            const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
            const md = forge.md.sha1.create();
            md.update(der);
            const thumbprint = md.digest().toHex().toUpperCase();

            // Extrair CPF ou CNPJ de acordo com o campo correto
            const cpfCnpjField = subjectAttrs.find(attr => attr.type === '2.16.76.1.3.1' || attr.type === '2.16.76.1.3.3');
            const cpf_cnpj = extractCpfCnpjFromAttrs(subjectAttrs.find(attr => attr.name === 'commonName')?.value) || cpfCnpjField?.value || '';

            const certInfo = {
                serial_number: serialNumber,
                issuer_name: issuerCN,
                not_valid_before: notBefore,
                not_valid_after: notAfter,
                thumbprint: thumbprint,
                subject_name: subjectCN,
                cpf_cnpj: cpf_cnpj,
                nome_razao_social: subjectCN
            };

            resolve(certInfo);
        } 
        catch (error) {
            console.error("Erro ao ler o certificado:", error);
            reject("Senha inválida ou certificado corrompido");
        }
    });
}