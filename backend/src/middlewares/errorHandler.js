function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error('[Erro]', {
    method: req.method,
    path: req.originalUrl,
    status,
    message: err.message,
    code: err.code || undefined,
  });

  if (status === 503) {
    return res.status(503).json({
      erro: 'Serviço indisponível',
      detalhes: isProduction
        ? 'Não foi possível concluir a operação. Tente novamente mais tarde.'
        : err.setupHint || err.message,
    });
  }

  if (status >= 500) {
    return res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
  }

  return res.status(status).json({
    erro: err.message || 'Requisição inválida',
  });
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    erro: 'Rota não encontrada',
    detalhes: `${req.method} ${req.originalUrl} não existe nesta API`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
