import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

function freightPDF(freight){

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const reportTitle = [
        {
            text: 'Freight',
            fontSize: 15, 
            bold: true,
            margin: [15, 20, 0, 45] // left, top, right, bottom
        }
    ];

    const details = [
        {text: 'Dados Principais:', fontSize: 14, bold: true, margin: [100, 0, 100, 0]},
        {
            table:{
                headerRows: 1,
                widths: [100, '*', 100, '*'],
                body: [
					[
                        {text: 'Em construção', style: 'tableHeader'}, 
                        {text: 'Em construção:', style: 'tableHeader'}, 
                        {text: 'Em construção:', style: 'tableHeader'},
                        {text: 'Em construção:', style: 'tableHeader'}
                    ],
					['Em construção', 'Em construção', 'Em construção', 'Em construção'],
				]
            },
            layout: 'headerLineOnly'
        }
    ];

    function Rodape(currentPage, pageCounf){
        return [
            {
                text: currentPage + ' / ' + pageCounf,
                aligment: 'right',
                fontSize: 9, 
                margin: [0, 10, 20, 0] // left, top, right, bottom
            }
        ]
    }

    const docDefinitios = {
        pageSize: 'A4',
        pageMargins: [15, 50, 15, 40],
        header: [reportTitle],
        content: [details],
        footer: [Rodape]
    }


    pdfMake.createPdf(docDefinitios).open()

}

export default freightPDF;