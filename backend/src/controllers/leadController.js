const leadService = require('../services/leadService');
const {
  isValidUuid,
  validateLeadPayload,
  sanitizeLeadBody,
} = require('../utils/validators');

function getActionMeta(req) {
  return {
    origem: req.headers['x-action-origin'] || req.body?.origemAcao || 'api',
    usuario: req.headers['x-user'] || req.body?.usuario || null,
  };
}

function invalidIdResponse(res) {
  return res.status(400).json({
    erro: 'Dados inválidos',
    detalhes: ['O parâmetro "id" deve ser um UUID válido'],
  });
}

async function create(req, res, next) {
  try {
    const validationErrors = validateLeadPayload(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: validationErrors,
      });
    }

    const lead = await leadService.createLead(
      sanitizeLeadBody(req.body),
      getActionMeta(req)
    );

    return res.status(201).json({
      mensagem: 'Lead cadastrado com sucesso',
      data: lead,
    });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const leads = await leadService.listLeads(search);

    return res.status(200).json({
      total: leads.length,
      data: leads,
    });
  } catch (error) {
    return next(error);
  }
}

async function listTrash(req, res, next) {
  try {
    const { search } = req.query;
    const leads = await leadService.listLeads(search, { deleted: true });

    return res.status(200).json({
      total: leads.length,
      data: leads,
    });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    if (!isValidUuid(req.params.id)) {
      return invalidIdResponse(res);
    }

    const lead = await leadService.getLeadById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        erro: 'Lead não encontrado',
      });
    }

    return res.status(200).json({
      data: lead,
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    if (!isValidUuid(req.params.id)) {
      return invalidIdResponse(res);
    }

    const validationErrors = validateLeadPayload(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: validationErrors,
      });
    }

    const lead = await leadService.updateLead(
      req.params.id,
      sanitizeLeadBody(req.body),
      getActionMeta(req)
    );

    return res.status(200).json({
      mensagem: 'Lead atualizado com sucesso',
      data: lead,
    });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    if (!isValidUuid(req.params.id)) {
      return invalidIdResponse(res);
    }

    const lead = await leadService.softDeleteLead(
      req.params.id,
      getActionMeta(req)
    );

    return res.status(200).json({
      mensagem: 'Lead movido para a lixeira',
      data: lead,
    });
  } catch (error) {
    return next(error);
  }
}

async function restore(req, res, next) {
  try {
    if (!isValidUuid(req.params.id)) {
      return invalidIdResponse(res);
    }

    const lead = await leadService.restoreLead(
      req.params.id,
      getActionMeta(req)
    );

    return res.status(200).json({
      mensagem: 'Lead restaurado com sucesso',
      data: lead,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  listTrash,
  getById,
  update,
  remove,
  restore,
};
