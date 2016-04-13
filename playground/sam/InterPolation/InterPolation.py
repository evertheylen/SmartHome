from copy import deepcopy

class InterPolate:
    # Important: use only functions, don't break my shit please
    def __init__(self, cumulative, unit=""):
        # @argument cumulative
            # A boolean that represents if the datapoints given are cumulative or not
            # This can be important for: measurements like temperature versus consumption over a time period
            # its hard to explain so here are some examples:
                # Energy consumption over time: cumulative = True
                # Financial income over a time period: cumulative = True
                # Temperature measurement: cumulative = False
                # Amount of money on your bank account: cumulative = False
        # @argument unit
            # unit is a string, this is not vital, the string defines the meaning of a 1
            # e.g. unit can be "month" so then InterPolate.info() returns "month"
            # this can be totally ignored if you want
        self.unit = unit
        self.dataPoints = []
        # P_ij is a reference to the Numerical Analasys course 2Ba-Inf University Antwerp p21-22
        self.P_ij = None

    def info(self):
        # Prints the optional string you gave to this object
        # You can use this to remember what lenght 1 means (e.g. a month, a day,...)
        return self.unit

    def getMaximumTime(self):
        # Of course you cannot exceed your previous data point, that would be extrapolation
        # this is the maximum value you can submit in InterPolate.getData(self, point)
        if (len(self.dataPoints) == 0):
            return 0;
        total = 0;
        for i in range(len(self.dataPoints)):
            total += self.dataPoints[i].length
        return total

    def addDataPoint(self, length, data):
        # Adds a datapoint, the length is dependant of the value you assigned to 1 (or the value you imagine is 1)
        # data is the data gathered over the period defined by length 
        # obvious arguments
        # TODO add exception maybe (prevent hax like negative length)
        self.dataPoints.append(DataPoint(length, data))

    def adjustNeville(self):
        # For in-class use only
        # Adds the DataPoint in the back of self.dataPoints using the Neville Method
        # This function is a reference to the Numerical Analasys course 2Ba-Inf University Antwerp p21-22
        i = i+1
        




class DataPoint:
    # Don't use this as a user pls
    def __init__(self, length, data):
        # @argument length
            # An integer or float that represents the length of the period between this datapoint and the NEXT NEW datapoint
            # Depends on the InterPolate class
        # @argument data
            # the data gathered of the data point e.g. a temperature, consumption over this period
        self.length = length
        self.data = data


class Polynomial:
    def __init__(self):
        self.coeff = [0]

    def degree(self):
        return len(self.coeff) - 1

    def setCoeff(self, coeff, degree):
        for i in range(0, degree - self.degree()):
            self.coeff.append(0)
        self.coeff[degree] = coeff

    def getCoeff(self, degree):
        # TODO add exception maybe for hackers
        return self.coeff[degree]

    def normalize(self):
        if (len(self.coeff) <= 1):
            return
        while (self.coeff[len(self.coeff) - 1] == 0 and len(self.coeff) > 1):
            del self.coeff[len(self.coeff) - 1]

    def __add__(self, otherPolynomial):
        if (otherPolynomial.degree() > self.degree()):
            self.setCoeff(0, otherPolynomial.degree())
        elif (otherPolynomial.degree() < self.degree()):
            otherPolynomial.setCoeff(0, self.degree())

        newPoly = Polynomial()
        for i in range(len(self.coeff)):
            newC = otherPolynomial.coeff[i] + self.coeff[i]
            newPoly.setCoeff(newC, i)
        newPoly.normalize()
        return newPoly

    def __mul__(self, otherPolynomial):
        newPoly = Polynomial()
        newPoly.setCoeff(0, self.degree() + otherPolynomial.degree())
        for i in range(len(self.coeff)):
            for j in range(len(otherPolynomial.coeff)):
                oldCoeff = newPoly.getCoeff(i + j)
                addCoeff = self.getCoeff(i) * otherPolynomial.getCoeff(j)
                newPoly.setCoeff(oldCoeff + addCoeff, i + j)
        newPoly.normalize()
        return newPoly

    def __str__(self):
        retVal = "P(X) = "
        for i in range(len(self.coeff)):
            if (i == 0):
                retVal += str(self.coeff[i])
                continue
            if (self.coeff[i] == 0):
                continue
            if (self.coeff[i] >= 0):
                retVal += " + "
            else:
                retVal += " - "
            retVal += str(abs(self.coeff[i])) + "X^(" + str(i) + ")"
        return retVal





