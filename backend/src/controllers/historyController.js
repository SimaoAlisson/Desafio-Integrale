const historyService = require('../services/historyService');
const { isValidUuid, isAllowedHistoryAction } = require('../utils/validators');

async function list(req, res, next) {
  try {
    const { leadId, action, search } = req.query;

    if (leadId && !isValidUuid(leadId)) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: ['O parâmetro "leadId" deve ser um UUID válido'],
      });
    }

    if (action && !isAllowedHistoryAction(action)) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: [
          'O parâmetro "action" deve ser: criacao, edicao, exclusao ou restauracao',
        ],
      });
    }

    const entries = await historyService.listHistory({
      leadId,
      action,
      search,
    });

    return res.status(200).json({
      total: entries.length,
      data: entries,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
};
