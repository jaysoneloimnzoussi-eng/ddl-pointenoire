import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  UnderlineType,
  convertInchesToTwip
} from 'docx';
import { formatDateFR } from './dateUtils';

export interface AttestationExportData {
  reference_number: string;
  establishment_name: string;
  promoter_title?: string;
  promoter_name: string;
  activity_type: string;
  quartier?: string;
  arrondissement: string;
  address?: string;
  date_emission?: string;
  signatory_name?: string;
}

/**
 * Format reference number to ensure the official MCAPNIT/DGL/DDL-PNR format
 */
export function formatOfficialRefNumber(rawRef: string, seq?: number | string): string {
  const clean = (rawRef || '').trim();
  if (clean.includes('MCAPNIT/DGL/DDL-PNR')) {
    return clean.startsWith('N°') ? clean : `N° ${clean}`;
  }
  const year = new Date().getFullYear();
  const num = seq || clean.replace(/\D/g, '').slice(-3) || '048';
  return `N° ${num}/MCAPNIT/DGL/DDL-PNR/SAA/${year}`;
}

/**
 * Format arrondissement human-friendly (e.g. '6_NGOYO' -> 'Ngoyo' or 'Arrondissement 6 Ngoyo')
 */
export function formatArrondissementHuman(arr: string): string {
  if (!arr) return 'Pointe-Noire';
  if (arr === '1_LUMUMBA') return 'Arrondissement 1 Lumumba';
  if (arr === '2_MVOUMVOU') return 'Arrondissement 2 Mvou-Mvou';
  if (arr === '3_TIETIE') return 'Arrondissement 3 Tié-Tié';
  if (arr === '4_LOANDJILI') return 'Arrondissement 4 Loandjili';
  if (arr === '5_MONGO_MPOUKOU') return 'Arrondissement 5 Mongo-Mpoukou';
  if (arr === '6_NGOYO') return 'Arrondissement 6 Ngoyo';
  return arr.replace(/^\d+_/, '');
}

/**
 * Generates an official Microsoft Word (.docx) document matching the exact
 * Congolese DDL-PN administrative standard for the Attestation de Dépôt.
 */
export async function generateAttestationDocx(data: AttestationExportData): Promise<Blob> {
  const dateFormatted = formatDateFR(data.date_emission || new Date());
  const refFormatted = formatOfficialRefNumber(data.reference_number);
  const promoterTitle = data.promoter_title || 'Monsieur';
  const promoterFull = `${promoterTitle} ${data.promoter_name || ''}`.trim();
  const arrLabel = formatArrondissementHuman(data.arrondissement);
  const locationText = data.address
    ? `${data.address}, ${data.quartier ? data.quartier + ', ' : ''}${arrLabel}`
    : `${data.quartier ? data.quartier + ', ' : ''}${arrLabel}`;

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' }
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.9)
            }
          }
        },
        children: [
          // 1. TOP HEADER TABLE: LEFT (MINISTRY & REF) / RIGHT (RÉPUBLIQUE DU CONGO À DROITE)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  // Left Cell: Ministerial Hierarchy & Official Reference
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "MINISTÈRE DE L'INDUSTRIE CULTURELLE,",
                            bold: true,
                            size: 17,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'TOURISTIQUE, ARTISTIQUE ET DES LOISIRS',
                            bold: true,
                            size: 17,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '----------------',
                            size: 14,
                            color: '888888',
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'DIRECTION GÉNÉRALE DES LOISIRS',
                            bold: true,
                            size: 16,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '--------',
                            size: 14,
                            color: '888888',
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'DIRECTION DÉPARTEMENTALE DES LOISIRS',
                            bold: true,
                            color: '006D2F',
                            size: 16,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'DE POINTE-NOIRE',
                            bold: true,
                            color: '006D2F',
                            size: 16,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '--------',
                            size: 14,
                            color: '888888',
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'SERVICE ASSISTANCE ET AUTORISATION',
                            bold: true,
                            size: 15,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        spacing: { before: 120 },
                        children: [
                          new TextRun({
                            text: refFormatted,
                            bold: true,
                            size: 18,
                            font: 'Times New Roman'
                          })
                        ]
                      })
                    ]
                  }),

                  // Right Cell: RÉPUBLIQUE DU CONGO À DROITE
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'RÉPUBLIQUE DU CONGO',
                            bold: true,
                            color: '006D2F',
                            size: 22,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Unité - Travail - Progrès',
                            italics: true,
                            size: 17,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: '----------------',
                            size: 14,
                            color: 'E5A910',
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 80 },
                        children: [
                          new TextRun({
                            text: `Pointe-Noire, le ${dateFormatted}`,
                            italics: true,
                            size: 18,
                            font: 'Times New Roman'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Space before title
          new Paragraph({
            spacing: { before: 360, after: 100 }
          }),

          // 2. DOCUMENT TITLE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "TITRE TRANSITOIRE D'EXPLOITATION",
                bold: true,
                color: '006D2F',
                size: 20,
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 360 },
            children: [
              new TextRun({
                text: 'ATTESTATION DE DÉPÔT',
                bold: true,
                color: '022448',
                size: 32,
                underline: {
                  type: UnderlineType.SINGLE,
                  color: '006D2F'
                },
                font: 'Times New Roman'
              })
            ]
          }),

          // 3. PARAGRAPHE 1 (Concise & exact)
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 360, after: 260 },
            children: [
              new TextRun({
                text: 'Par la présente, je soussigné, Directeur Départemental des Loisirs de Pointe-Noire, atteste que ',
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: promoterFull,
                bold: true,
                color: '022448',
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: ", a déposé un dossier d'instruction en vue de solliciter l'agrément officiel d'exploitation d'un ",
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: data.activity_type || 'Établissement de loisirs',
                bold: true,
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: ', dénommé « ',
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: data.establishment_name || '',
                bold: true,
                color: '022448',
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: ' », sis à ',
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: locationText,
                italics: true,
                size: 22,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: '.',
                size: 22,
                font: 'Times New Roman'
              })
            ]
          }),

          // 4. PARAGRAPHE 2
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 360, after: 260 },
            children: [
              new TextRun({
                text: "La présente attestation est délivrée à titre transitoire pour permettre la continuité des activités durant la phase d'instruction technique et de mise en conformité du dossier.",
                size: 22,
                font: 'Times New Roman'
              })
            ]
          }),

          // 5. PARAGRAPHE 3
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 360, after: 360 },
            children: [
              new TextRun({
                text: 'En foi de quoi, la présente attestation lui est établie pour servir et valoir ce que de droit. /-',
                bold: true,
                size: 22,
                font: 'Times New Roman'
              })
            ]
          }),

          // Space before footer
          new Paragraph({
            spacing: { before: 240, after: 120 }
          }),

          // 6. BOTTOM FOOTER TABLE: AMPLIATIONS (LEFT) & SIGNATURE (RIGHT)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  // Left: Ampliations
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'AMPLIATIONS :',
                            bold: true,
                            size: 18,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        spacing: { before: 40 },
                        children: [
                          new TextRun({
                            text: '• SAA / SAF / Chrono',
                            size: 18,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '• Intéressé(e)',
                            size: 18,
                            font: 'Times New Roman'
                          })
                        ]
                      })
                    ]
                  }),

                  // Right: Fait à Pointe-Noire & Signature
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `Fait à Pointe-Noire, le ${dateFormatted}`,
                            italics: true,
                            size: 18,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 60, after: 100 },
                        children: [
                          new TextRun({
                            text: '[Sceau & Paraphe Officiel]',
                            italics: true,
                            color: '777777',
                            size: 15,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: data.signatory_name || 'JEAN RICHARD NTSEKE NGOUAKA',
                            bold: true,
                            color: '022448',
                            size: 22,
                            font: 'Times New Roman'
                          })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Directeur Départemental des Loisirs',
                            italics: true,
                            size: 16,
                            font: 'Times New Roman'
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers instant browser download of the Word (.docx) document
 */
export async function downloadAttestationDocx(data: AttestationExportData, customFilename?: string): Promise<void> {
  const blob = await generateAttestationDocx(data);
  const safeEstName = (data.establishment_name || 'Etablissement')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 35);
  const filename = customFilename || `Attestation_Depot_${safeEstName}.docx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
