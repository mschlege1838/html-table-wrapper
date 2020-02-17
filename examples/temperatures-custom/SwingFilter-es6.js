

class SwingFilter {
    
    constructor(gtRange, lteRange, highColumnIndex, lowColumnIndex) {
        this.gtRange = gtRange;
        this.lteRange = lteRange;
        this.highColumnIndex = highColumnIndex;
        this.lowColumnIndex = lowColumnIndex;
    }
    
    include(row) {
        const cells = row.cells;
        
        const currentSwing = Number.parseFloat(cells[this.highColumnIndex].textContent) - Number.parseFloat(cells[this.lowColumnIndex].textContent)
        if (Number.isNaN(currentSwing)) {
            return false;
        }
        
        const gtRange = this.gtRange;
        const lteRange = this.lteRange;
        
        if (!Number.isNaN(gtRange) && !(currentSwing > gtRange)) {
            return false;
        }
        if (!Number.isNaN(lteRange) && !(currentSwing <= lteRange)) {
            return false;
        }
        
        return true;
    }
}