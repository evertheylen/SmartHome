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
        # just to remember which Pi i'm on
        self.Neville = 0

    def info(self):
        # Prints the optional string you gave to this object
        # You can use this to remember what lenght 1 means (e.g. a month, a day,...)
        return self.unit

    def getMaximumTime(self):
        # Of course you cannot exceed your previous data point, that would be extrapolation
        # this is the maximum value you can submit in InterPolate.getData(self, point)
           # TODO remove this function, its baaaaaaad
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
        if (len(self.dataPoints) == 0):
            dataPointStart = 0
        else:
            dataPointStart = self.dataPoints[len(self.dataPoints) - 1].length
        newLength = length + dataPointStart
        self.dataPoints.append(DataPoint(newLength, data))
        self.adjustNeville()

    def adjustNeville(self):
        # For in-class use only
        # Adds the DataPoint in the back of self.dataPoints using the Neville Method
        # This function is a reference to the Numerical Analasys course 2Ba-Inf University Antwerp p21-22
        data = self.dataPoints[len(self.dataPoints) - 1].data
        length = self.dataPoints[len(self.dataPoints) - 1].length
        if (self.P_ij == None):
            # base case
            poly = Polynomial()
            poly.setCoeff(data, 0)
            self.P_ij = {"0": [poly, length]}
            self.Neville += 1
            return
        # see p 22 of the course (the table; here we generate a row)
        currentIndex = ""
        for i in range(0, self.Neville + 1):
            if (i != 0):
                currentIndex = str(self.Neville - i) + "," + currentIndex
            else:
                currentIndex = str(self.Neville - i)
            tj = self.dataPoints[self.Neville - i].length
            tjk = self.dataPoints[self.Neville].length
            tj_data = self.dataPoints[self.Neville - i].data
            tjk_data = self.dataPoints[self.Neville].data
            NevillePoly = self.createNeville(currentIndex, tj, tjk, tj_data, tjk_data)
            self.P_ij[currentIndex] = [NevillePoly, length]
        self.Neville += 1

    def createNeville(self, index, tj, tjk, tj_data, tjk_data):
        # Creates Neville Polynome with that index (see course referred to)
        # Assumes all needed Polynomes exist
        # don't use this outside the class pls
        # tjk refers to t(j + k) in t
        indices = index.split(",")
        if (len(indices) == 1):
            poly = Polynomial()
            poly.setCoeff(tjk_data, 0)
            return poly
        needed = indices[:]
        del needed[0]
        neededIndex = ",".join(needed)

        poly1 = self.P_ij[neededIndex][0]
        needed2 = indices[:]
        del needed2[len(needed2) - 1]
        neededIndex2 = ",".join(needed2)
        poly2 = self.P_ij[neededIndex2][0]

        poly11 = Polynomial()
        poly11.setCoeff(1, 1)
        poly11.setCoeff(-tj, 0)

        poly22 = Polynomial()
        poly22.setCoeff(1, 1)
        poly22.setCoeff(-tjk, 0)

        resultPolyNomial = (poly11 * poly1 - poly22 * poly2)
        resultPolyNomial.divide(tjk - tj)
        return resultPolyNomial



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

    def __sub__(self, otherPolynomial):
        poly = Polynomial()
        for i in range(len(otherPolynomial.coeff)):
            poly.setCoeff(-otherPolynomial.getCoeff(i), i)
        retVal = poly.__add__(self)
        return retVal

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

    def divide(self, integer):
        for i in range(len(self.coeff)):
            self.coeff[i] /= integer

    def getValue(self, point):
        total = self.coeff[0]
        for i in range(1, len(self.coeff)):
            total += self.coeff[i] * pow(point, i)
        return total

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

IP = InterPolate(False)
IP.addDataPoint(5,78)
IP.addDataPoint(5,61)
IP.addDataPoint(5,48)
IP.addDataPoint(5,36)
IP.addDataPoint(5,29)
IP.addDataPoint(5,22)

print(IP.P_ij["0,1,2,3,4,5"][0].getValue(18))

