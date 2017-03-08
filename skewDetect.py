import matplotlib.pyplot as plot
import numpy
import scipy.ndimage.filters
import scipy.ndimage.interpolation
import os
import math
import sys
from scipy import ndimage
from scipy import misc
S=30
def getRSX(face,Y1,Y2,x,s,d):
    sum = 0
    Y = face.shape[0]
    
    for y in range(s,Y-abs(s)-1):
        print(face[y][x])
        sum+=face[y][x]*face[y+s][x+d]
    return sum
def getRS(face,Y1,Y2,s,d):
    sum=0
    X = face.shape[1]
    Y = face.shape[0]
    #for i in range(X-d):    
    #    sum+=getRSX(face,Y1,Y2,i,s,d)
    for y in range(S,Y-S):
        #print(face[y][Y1])
        if face[y][Y1] and face[y+s][Y2]:
            sum+=1
    return sum
def smoothHist(hist):
    hasil=[]
    for i in range(len(hist)):
        sum = 0
        if i>0:
            sum+=hist[i-1]
        if i<len(hist)-1:
            sum+=hist[i+1]
        sum+=hist[i]
        sum=sum/3
        hasil.append(sum)
    return hasil
filename = sys.argv[1]
face = misc.imread(filename,flatten=True)
#face2 = scipy.ndimage.filters.gaussian_filter(face,0.000001)
face2 = face >245
#plot.imshow(face2)
#plot.show()
#plot.imshow(face,cmap=plot.cm.gray)
#plot.show()

shape = face.shape
print(shape)
width = shape[1]
height = shape[0]
histP = numpy.zeros(width)
for j in range(width):
    for i in range(height):
        if face2[i][j]==0:
            histP[j]+=1
#for i in range(40):
#    histP = smoothHist(histP)
#plot.plot(histP)
#plot.show()

leftHist = histP[:int(len(histP)/2)]
rightHist = histP[int(len(histP)/2):]    
Y1=0
Y2=0
while True:
    maxLeft = max(leftHist)
    indLeft = numpy.where(leftHist==maxLeft)
    indLeft = indLeft[0][0]
    if indLeft<5:
        leftHist[indLeft]=0
        continue
    #print(maxLeft,leftHist[indLeft],indLeft)
    if numpy.prod(histP[indLeft-5:indLeft+5])>0:#histP[indLeft-1]>0 and histP[indLeft+1]>0:
        Y1=indLeft
        break;
    else:
        leftHist[indLeft]=0
while True:
    maxRight = max(rightHist)
    indRight = numpy.where(rightHist==maxRight)#rightHist.index(maxRight)
    indRight = indRight[0][0]
    if indRight>len(histP)-5:
        rightHist[indRight]=0
        continue
    if numpy.prod(histP[indRight-5+len(rightHist):indRight+5+len(rightHist)])>0:#histP[indLeft-1+len(rightHist)]>0 and histP[indLeft+1+len(rightHist)]>0:
        Y2 = indRight+len(rightHist)
        break
    else:
        rightHist[indRight]=0
#Y1 = width*0.25
#Y2 = width*0.70
print("Y1=%d,Y2=%d"%(Y1,Y2))
d = int(Y2-Y1)

#print(d)
maxRS = 0
optS = -100
for s in range(-S,S):
    curRS = getRS(face2,int(Y1),int(Y2),s,d)
    if curRS>maxRS:
        maxRS=curRS
        optS=s
print(optS/float(d))
atanRad = math.atan(optS/float(d))
face2 = scipy.ndimage.interpolation.rotate(face,numpy.rad2deg(atanRad),cval=255)
for y in range(height):
    face[y][int(Y1)]=0
    face[y][int(Y2)]=0
misc.imsave("pp.png",face)
misc.imsave("pp2.png",face2)
plot.imshow(face2)
plot.show()
