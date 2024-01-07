class Validation{
    static email = (email:string):boolean =>{
        const emailPattern:  RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        return emailPattern.test(email)
    }
}

export default Validation