const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001; 

app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'users.json');

function getUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE));
    } catch (e) {
        return [];
    }
}

app.post('/api/claim', (req, res) => {
    const { walletAddress, tasksCompleted } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ success: false, message: 'عنوان المحفظة مطلوب' });
    }

    if (!tasksCompleted || !tasksCompleted[1] || !tasksCompleted[2]) {
        return res.status(403).json({ success: false, message: 'يجب إتمام كافة المهام أولاً!' });
    }

    let users = getUsers();
    const existingUser = users.find(u => u.wallet === walletAddress);
    if (existingUser) {
        return res.json({ success: false, message: 'لقد حصلت على مكافأتك مسبقاً!' });
    }

    users.push({
        wallet: walletAddress,
        balance: 100,
        claimedAt: new Date().toISOString()
    });

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    return res.json({ 
        success: true, 
        message: 'تمت إضافة 100 TERA بنجاح!', 
        balance: 100 
    });
});

app.listen(PORT, () => {
    console.log(`TERA Airdrop running on port ${PORT}`);
});

