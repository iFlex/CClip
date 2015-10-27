module.exports = function(shared){
  for( k in shared )
    this[k] = shared[k];
}
