const express = require('express');
const router = express.Router();
const db = require('../config/db');  

router.get('/ekosistemlaut.ejs', (req, res) => {
    const query = "SELECT h.*, n.nama FROM ekosistem_laut h JOIN data_peneliti n ON h.id_peneliti = n.id";
    
    let filters = '';
    if (req.query.id_peneliti) {
        filters = " WHERE h.id_peneliti = ?";
    }

    db.query(query + filters, [req.query.id_peneliti], (err, result) => {
        if (err) throw err;

        db.query('SELECT * FROM data_peneliti', (err, penelitiResult) => {
            if (err) throw err;

            res.render('ekosistemlaut', {
                ekosistemlaut: result,
                peneliti: penelitiResult
            });
        });
    });
});

module.exports = router;
