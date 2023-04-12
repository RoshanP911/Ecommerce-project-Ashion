

let adminLoggedIn=async(req,res,next)=>{
    try {
        if(req.session.admin){   
            next()
        }
        else{
            return res.redirect('/admin')  
        }

    } catch (error) {
        console.log(error.message)
    }
    }

        module.exports={
            adminLoggedIn,
        }
