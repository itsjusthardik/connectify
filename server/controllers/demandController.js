import Demand from '../models/Demand.js'
import Notification from '../models/Notification.js'
import asyncHandler from '../utils/asyncHandler.js'
import sendResponse from '../utils/sendResponse.js'

// Create a demand post
const createDemand = asyncHandler(async (req, res) => {
  const { title, description, category, budget,
          budgetType, deadline, skills } = req.body

  if (!title?.trim()) {
    return sendResponse(res, 400, false, 'Title is required')
  }
  if (!description?.trim()) {
    return sendResponse(res, 400, false, 'Description is required')
  }
  if (!category) {
    return sendResponse(res, 400, false, 'Category is required')
  }

  const demand = await Demand.create({
    author: req.user.id,
    title: title.trim(),
    description: description.trim(),
    category,
    budget: budget || 0,
    budgetType: budgetType || 'negotiable',
    deadline: deadline || null,
    skills: skills || []
  })

  await demand.populate('author', 'name role profileImage customRole hourlyRate')

  return sendResponse(res, 201, true, 'Post created successfully', { demand })
})

// Get all open demands (feed)
const getDemands = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query

  const query = { status: 'open' }
  if (category && category !== 'all') query.category = category

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const total = await Demand.countDocuments(query)

  const demands = await Demand.find(query)
    .populate('author', 'name role profileImage customRole hourlyRate')
    .populate('responses.user', 'name role profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))

  return sendResponse(res, 200, true, 'Demands retrieved successfully', {
    demands,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  })
})

// Get my own demands
const getMyDemands = asyncHandler(async (req, res) => {
  const demands = await Demand.find({ author: req.user.id })
    .populate('responses.user', 'name role profileImage')
    .sort({ createdAt: -1 })

  return sendResponse(res, 200, true, 'Your posts retrieved successfully', { demands })
})

// Respond to a demand
const respondToDemand = asyncHandler(async (req, res) => {
  const { message } = req.body
  const demand = await Demand.findById(req.params.id)

  if (!demand) {
    return sendResponse(res, 404, false, 'Post not found')
  }
  if (demand.status === 'closed') {
    return sendResponse(res, 400, false, 'This post is closed')
  }
  if (demand.author.toString() === req.user.id.toString()) {
    return sendResponse(res, 400, false, 'You cannot respond to your own post')
  }

  // Check if already responded
  const alreadyResponded = demand.responses.some(
    r => r.user.toString() === req.user.id.toString()
  )
  if (alreadyResponded) {
    return sendResponse(res, 400, false, 'You have already responded to this post')
  }

  demand.responses.push({
    user: req.user.id,
    message: message?.trim() || ''
  })
  await demand.save()

  // Notify the demand author
  await Notification.create({
    user: demand.author,
    type: 'request_received',
    message: `${req.user.name} responded to your post: "${demand.title}"`,
    relatedRequest: demand._id
  })

  return sendResponse(res, 200, true, 'Response sent successfully')
})

// Close a demand (only author)
const closeDemand = asyncHandler(async (req, res) => {
  const demand = await Demand.findById(req.params.id)
  if (!demand) {
    return sendResponse(res, 404, false, 'Post not found')
  }
  if (demand.author.toString() !== req.user.id.toString()) {
    return sendResponse(res, 403, false, 'Only the author can close this post')
  }
  demand.status = 'closed'
  await demand.save()
  return sendResponse(res, 200, true, 'Post closed successfully')
})

// Delete a demand (only author)
const deleteDemand = asyncHandler(async (req, res) => {
  const demand = await Demand.findById(req.params.id)
  if (!demand) {
    return sendResponse(res, 404, false, 'Post not found')
  }
  if (demand.author.toString() !== req.user.id.toString()) {
    return sendResponse(res, 403, false, 'Only the author can delete this post')
  }
  await demand.deleteOne()
  return sendResponse(res, 200, true, 'Post deleted successfully')
})

export {
  createDemand, getDemands, getMyDemands,
  respondToDemand, closeDemand, deleteDemand
}
