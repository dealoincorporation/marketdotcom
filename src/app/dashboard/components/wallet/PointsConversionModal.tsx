"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PointsConversionModalProps {
  totalPoints: number
  convertiblePoints: number
  pointsToConvert: string
  isConverting: boolean
  pointsSettings: {
    nairaPerPoint: number
    minimumPointsToConvert: number
  }
  onPointsToConvertChange: (value: string) => void
  onConvert: () => void
  onClose: () => void
}

export function PointsConversionModal({
  totalPoints,
  convertiblePoints,
  pointsToConvert,
  isConverting,
  pointsSettings,
  onPointsToConvertChange,
  onConvert,
  onClose,
}: PointsConversionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center space-x-2">
              <Star className="h-6 w-6 text-orange-600" />
              <span>Convert Points to Cash</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-800 font-medium">Your Points</span>
                <span className="text-orange-900 font-bold">{totalPoints.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-800 font-medium">Conversion Rate</span>
                <span className="text-orange-900">{pointsSettings.nairaPerPoint} pts = ₦1</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points to Convert
              </label>
              <input
                type="number"
                value={pointsToConvert}
                onChange={(e) => onPointsToConvertChange(e.target.value)}
                placeholder="Enter points amount"
                min={pointsSettings.minimumPointsToConvert}
                max={convertiblePoints}
                step={pointsSettings.nairaPerPoint}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">
                Minimum: {pointsSettings.minimumPointsToConvert} pts • Maximum: {convertiblePoints} pts • Available: {totalPoints} pts
              </p>
            </div>

            {pointsToConvert && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">You will receive</span>
                  <span className="text-green-900 font-bold text-lg">
                    ₦{Math.floor(parseInt(pointsToConvert || "0") / pointsSettings.nairaPerPoint)}
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Amount is added to your wallet immediately after conversion
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isConverting}
              >
                Cancel
              </Button>
              <Button
                onClick={onConvert}
                disabled={!pointsToConvert || parseInt(pointsToConvert) < pointsSettings.minimumPointsToConvert || isConverting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isConverting ? "Converting..." : "Convert Points"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
