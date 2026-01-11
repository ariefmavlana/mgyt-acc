import { Request, Response } from 'express';
import { TRANSACTION_TEMPLATES } from '../lib/transaction-templates';

export const getTemplates = (req: Request, res: Response) => {
    res.json(TRANSACTION_TEMPLATES);
};

export const getTemplate = (req: Request, res: Response) => {
    const { id } = req.params;
    const template = TRANSACTION_TEMPLATES.find(t => t.id === id);
    if (!template) {
        return res.status(404).json({ message: 'Template tidak ditemukan' });
    }
    res.json(template);
};
