module.exports = function(){
    var TYPE = null;
    var LENGTH = null;
    var DETAILS = null;

    var buffChip       = null;
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
        return null;
    }

    this.digest = function(buff){
        if(buffChip){
            buff = buffConcat(buffChip,buff);
            buffChip = null;
        }
        
        var index = 0;
        if(TYPE === null){
            TYPE = buff.readInt8(0);
            index++;
        }
        
        if(LENGTH === null){
            if(buff.length > 2){
                LENGTH = buff.readInt16LE(1);
                index += 2;
            } else {
                buffChip = getBuffChip(buff,index);
                return null;
            }
        }
        
        if(DETAILS === null){
            DETAILS = "";
        }
        while(index < buff.length || DETAILS.length < LENGTH){
            DETAILS += buff.readUInt8(index++);
        }
        return getBuffChip(buff,index);
    }

    this.stringify = function(){
        var buff = new Buffer(1+LENGTH);
        buff.writeUInt8(TYPE);
        buff.writeUInt16BE(LENGTH);
        for(var i = 0; i < LENGTH; ++i ){
            buff.writeUInt8(DETAILS[i]);
        }

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
    }
}