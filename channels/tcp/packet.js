module.exports = function(){
    var TYPE = null;
    var LENGTH = null;
    var DETAILS = null;
    var buffChip = null;

    var overflow       = new Buffer(0);
    function buffConcat(buff1,buff2){
        var result = new Buffer(buff1.length+buff2.length);
        buff1.copy(result,0,0,buff1.length);
        buff2.copy(result,buff1.length,0,buff2.length);
        return result;
    }

    function getBuffChip(buff, index){
        if(index < buff.length) {
            var newB = new Buffer(buff.length - index);
            buff.copy(newB,0,index,buff.length);
            return newB;
        }
        return new Buffer(0);
    }

    this.digest = function(buff){
        if(this.isComplete()){
            overflow = buffConcat(overflow,buff);
            return;
        }

        if(buffChip){
            buff = buffConcat(buffChip,buff);
            buffChip = null;
        }
        
        var index = 0;
        if(TYPE === null){
            TYPE = buff.readUInt8(0);
            index++;
        }
        
        if(LENGTH === null){
            if(buff.length > 2){
                LENGTH = buff.readUInt16BE(1);
                index += 2;
            } else {
                buffChip = getBuffChip(buff,index);
                return null;
            }
        }
        
        if(DETAILS === null){
            DETAILS = "";
        }
        DETAILS += buff.toString('utf8',index,LENGTH);
        overflow = buffConcat(overflow,getBuffChip(buff,index+LENGTH));
    }

    this.stringify = function(){
        var buff = new Buffer(3+LENGTH);
        buff.writeUInt8(TYPE,0);
        buff.writeUInt16BE(LENGTH,1);
        console.log("stringify details of length:"+LENGTH+">"+DETAILS);
        buff.write(DETAILS,3,DETAILS.length);

        return buff;
    }

    this.isComplete = function(){
        if(!(LENGTH === null) && LENGTH == DETAILS.length){
            return true;
        }
        return false;
    }

    this.getType = function(){
        return TYPE;
    }
    this.getLength = function(){
        return LENGTH;
    }
    this.getDetails = function(){
        return DETAILS;
    }

    this.setType = function(type){
        TYPE = type;
    }
    this.setLength = function(length){
        LENGTH = length;
    }
    this.setDetails = function(details){
        DETAILS = details;
        if(!LENGTH)
            LENGTH = details.length
    }
}