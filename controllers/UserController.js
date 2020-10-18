import User from './../models/user.js';
import Cashier from './../models/cashier.js';
import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import Conf from './../config.js';

const userRouter = express.Router();
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


//CREATE user
userRouter.post('/register', async (req, res) => {
    try{
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        User.create({
            username : req.body.username,
            nbelakang : req.body.nbelakang,
            password : hashedPassword,
            jabatan : req.body.jabatan
        },
            function (err, user) {
            if (err) return res.status(500).send("There was a problem registering the user.")
            res.status(200).send(`${user} Berhasil Daftar`);
            }); 
    } 
    catch(error){
        res.status(500).json({ error: error})
    }
})

//READ all data users
userRouter.get('/datauser', async (req,res) => {
    const user =  await User.find({});

    if(user && user.length !== 0) {
        res.json(user)
    } else {
        res.status(404).json({
            message: 'Users not found'
        });
    }
});

//READ user by ID
userRouter.get('/datauser/:id', async (req,res) => {
    const user = await User.findById(req.params.id);

    if(user) {
        res.json(user)
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    }
});

//UPDATE data user
userRouter.put('/datauser/:id', async (req,res) => {
    const {username, password, nbelakang, jabatan} = req.body;

    const user = await User.findById(req.params.id);

    if (user) {

        var saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds);
        user.username = username;
        user.password = hashedPw;
        user.nbelakang = nbelakang;
        user.jabatan = jabatan;

        const updateDatauser = await user.save()

        res.send(updateDatauser);
    } else {
        res.status(404).json({
            message: 'User not found'
        })
    }
})

//DELETE user by ID
userRouter.delete('/datauser/:id', async (req,res) => {

    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        res.json({
            message: 'Data removed'
        })
    } else {
        res.status(404).json({
            message: 'User not found' 
        })       
    }
})

//DELETE all data users
userRouter.delete('/datauser', async (req, res) => {
    const user = await User.deleteMany();

    if (user) {
        res.json({
        message: 'all users removed'
        })
    } else {
        res.status(404).json({
        message: 'user not found'
        })
    }
})

//DELETE all data users
userRouter.delete('/transaksi', async (req, res) => {
    const cashier = await Cashier.deleteMany();

    if (cashier) {
        res.json({
        message: 'all transaksi removed'
        })
    } else {
        res.status(404).json({
        message: 'transaksi not found'
        })
    }
})

//login
userRouter.post('/login', async (req, res) => {
    try{
        const{
            username,
            password
        } = req.body;
        
        const currentUser = await new Promise((resolve, reject) =>{
            User.find({"username": username}, function(err, user){
                if(err)
                    reject(err)
                resolve(user)
            })
        })
        
        //cek apakah ada user?
        if(currentUser[0]){
            //check password
            bcrypt.compare(password, currentUser[0].password).then(function(result) {
                if(result){
                    const user = currentUser[0];  
                    console.log(user);
                    //urus token disini
                    var token = jwt.sign({ user }, Conf.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.status(200).send({ auth: true, token: token });
                    res.status(201).json({"status":"logged in!"});
                } else {
                    res.status(201).json({"status":"wrong password."});
                }
            });
        } else {
            res.status(201).json({"status":"username not found"});
        }
    } catch(error){
        res.status(500).json({ error: error})
    }
})


// check data login
userRouter.get('/check', async (req, res) => {
    
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        // const jabatan = decoded.jabatan;
        // console.log(jabatan);
        res.status(200).send(decoded);
    });
});



// Mengambil uang ( hanya BOS )
userRouter.post('/mengambil-uang', function(req, res) {
    //header apabila akan melakukan akses
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const jabatan = decoded.user.jabatan;
        console.log(decoded);
            if( jabatan != '0'){
            Cashier.create({
                "jtransaksi":`${decoded.user.nbelakang} Mengambil Uang Status Tidak Memiliki Wewenang`

            },function(err,user)
            {
            if(err) return res.status(500).send("There was a problem transaksi.")
            });

            res.status(200).send(`${decoded.user.nbelakang} Tidak Memiliki Wewenang`);
            }else{

            Cashier.create({
                "jtransaksi":`${decoded.user.nbelakang} Mengambil Uang Status Bisa Melakukan`

            },function(err,user)
            {
            if(err) return res.status(500).send("There was a problem transaksi.")
            });
            res.status(200).send(`${decoded.user.nbelakang} Bisa Melakukan`);
        }
    });
});

// Memasukkan uang ke Cashier
userRouter.post('/input-money',async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

                Cashier.create({
                    "jtransaksi":`${decoded.user.nbelakang} Masukin Uang Status Bisa Melakukan`

                },function(err,user)
                {
                if(err) return res.status(500).send("There was a problem transaksi.")
                });

                    res.status(200).send(`${decoded.user.nbelakang} Bisa Melakukan`);
    });
});

// cek saldo
userRouter.post('/cek-saldo', function(req, res) {
    //header apabila akan melakukan akses
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const jabatan = decoded.user.jabatan;
        if(jabatan == '2'){

            Cashier.create({
                "jtransaksi":`${decoded.user.nbelakang} Melihat Saldo total Status Tidak Memiliki wewenang`

            },function(err,user)
            {
            if(err) return res.status(500).send("There was a problem transaksi.")
            });


            res.status(200).send(`${decoded.user.nbelakang} Tidak Memiliki Wewenang`);
        }else{

            Cashier.create({
                "jtransaksi":`${decoded.user.nbelakang} Melihat Saldo Total Status Bisa Melakukan`

            },function(err,user)
            {
            if(err) return res.status(500).send("There was a problem transaksi.")
            });

            res.status(200).send(`${decoded.user.nbelakang} Bisa Melakukan`);
        }
    });
});

//update jabaatn
userRouter.put('/update/:id', async (req,res) => {
    const {nbelakang,jabatan,username, password} = req.body;

    const user = await User.findById(req.params.id);

        if(user){
            if(username === undefined){
                user.username = user.username;
            }else{
                user.username= username;
            }

            if(jabatan === undefined){
                user.jabatan = user.jabatan;
            }else{
                user.jabatan= jabatan;
            }

            if(nbelakang === undefined){
                user.nbelakang = user.nbelakang;
            }else{
                user.nbelakang= nbelakang;
            }

            if(password === undefined){
                user.password = user.password;
            }else{
                var saltRounds =10;
                const hashedPw = await bcrypt.hash(password, saltRounds);
                user.password = hashedPw;
            }
            const updateUser = await user.save();

            res.json(updateUser);

        }else{
            res.status(404).json({
                massage :'User not found'
            })
        }
});

//menampilkan seluruh aktivitas kasir
userRouter.get('/aktivitas-kasir', async (req,res) => {
    const Aktivitas_Kasir = await Cashier.find({});

    if(Aktivitas_Kasir && Aktivitas_Kasir.length !== 0){
        res.json(Aktivitas_Kasir)
    }else{
        res.status(404).json({
            message:"Aktivitas Kasir not found"
        })
    }
} );

export default userRouter;