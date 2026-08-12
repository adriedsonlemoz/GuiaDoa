/**
 * Executa upload sequencial de um lote e desfaz o que já foi enviado se algum
 * item falhar. As funções são injetadas para permitir testes sem Cloudinary.
 */
export async function executarUploadLote(arquivos, { upload, destroy }) {
  const enviados = [];
  try {
    for (const arquivo of arquivos || []) {
      const result = await upload(arquivo);
      enviados.push({
        url: result.secure_url,
        publicId: result.public_id,
        fonte: 'cloudinary',
      });
    }
    return enviados;
  } catch (err) {
    await Promise.allSettled(
      enviados.filter(x => x.publicId).map(x => destroy(x.publicId))
    );
    throw err;
  }
}
