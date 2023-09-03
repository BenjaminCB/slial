module MonteCarle where

import System.Random
import Data.List

-- Estimate the percentage of cords that intersect in a cirle using random angles
-- to represent cords and seeing if the have the proper order
--
-- Not sure order thing is correct mathematically, but intuition says that it is
cordChance :: IO ()
cordChance = do
    let nAngles = 1000000
        nAnglesFloat = 1000000.0
        seed1 = 137
        seed2 = 3331
        seed3 = 13
        seed4 = 1359
        cords1 = oneList (rand0Pi nAngles seed1) (rand0Pi nAngles seed2)
        sorted1 = map smallFst cords1
        cords2 = oneList (rand0Pi nAngles seed3) (rand0Pi nAngles seed4)
        sorted2 = map smallFst cords2
        num = intersections sorted1 sorted2 0
    print $ num / nAnglesFloat

-- Estimate the value of pi using random points of (0,0) to (1,1) and seing if
-- they are in the unit circle
estimatePi :: IO ()
estimatePi = do
    let nPoints      = 1000000
        nPointsFloat = 1000000.0
        seed1        = 137
        seed2        = 3331
        points       = oneList (rand01 nPoints seed1) (rand01 nPoints seed2)
        inCircleList = map inCircle points
        num          = numInCirle inCircleList 0
        piEstimate   = 4 * num / nPointsFloat
    print piEstimate

-- given length and a seed return a list of that length with random floats
randFloatList :: Double -> Int -> Int -> [Double]
randFloatList max num seed =
    let ran :: RandomGen g => Int -> g -> [Double]
        ran n = take n . unfoldr (Just . uniformR (0 :: Double, 1 :: Double))
        pureGen = mkStdGen seed
    in
        ran num pureGen :: [Double]

rand01 :: Int -> Int -> [Double]
rand01 num seed = randFloatList 1 num seed

rand0Pi :: Int -> Int -> [Double]
rand0Pi num seed = randFloatList (2 * pi) num seed

-- turn two lists into a list of tuples
oneList :: [a] -> [b] -> [(a, b)]
oneList [] _ = []
oneList (x:xs) (y:ys) = [(x,y)] ++ (oneList xs ys)

smallFst :: Ord a => (a, a) -> (a, a)
smallFst (a, b) =
    if a <= b
    then (a, b)
    else (b, a)

-- Calculate the number of intersections in a list of cords as angles
intersections :: (Ord a, Num b) => [(a, a)] -> [(a, a)] -> b -> b
intersections [] [] n = n
intersections (x:xs) (y:ys) n =
    if snd x <= fst y || snd y <= fst x
    then intersections xs ys (n + 1)
    else intersections xs ys n

-- is a point in the first quarter of the unit circle
inCircle :: (Floating a, Ord a) => (a, a) -> Bool
inCircle point = hypot point <= 1

-- given to "lengths" return the hypothenuse
hypot :: Floating a => (a, a) -> a
hypot (a, b) = sqrt $ a ** 2 + b ** 2

-- Count the number of trues in a list
numInCirle :: Fractional a => [Bool] -> a -> a
numInCirle [] n = n
numInCirle (x:xs) n =
    if x
    then numInCirle xs (n + 1)
    else numInCirle xs n
